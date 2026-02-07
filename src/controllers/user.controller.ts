import { Request, Response } from 'express';
import { User } from '../entities/User';
import { Post } from '../entities/Post';
import { Activity, ActivityType } from '../entities/Activity';
import { AppDataSource } from '../data-source';

export class UserController {
  // Shorter aliases - cleaner to reference in methods
  private static users = AppDataSource.getRepository(User);
  private static posts = AppDataSource.getRepository(Post);
  private static activities = AppDataSource.getRepository(Activity);

  static async getAllUsers(_req: Request, res: Response) {
    try {
      const list = await this.users.find();
      return res.json(list);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const id = +req.params.id; // shorthand for parseInt
      const user = await this.users.findOneBy({ id });
      
      if (!user) return res.status(404).json({ msg: 'User not found' });
      return res.json(user);
    } catch (err) {
      return res.status(500).json({ error: 'Lookup failed' });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Quick check for existing email
      const conflict = await this.users.findOne({ where: { email } });
      if (conflict) {
        return res.status(409).json({ msg: 'Email is already taken' });
      }

      const newUser = this.users.create(req.body);
      const saved = await this.users.save(newUser);
      
      return res.status(201).json(saved);
    } catch (err) {
      console.error("User signup error:", err);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const user = await this.users.findOneBy({ id: +req.params.id });
      if (!user) return res.status(404).json({ msg: 'User not found' });

      this.users.merge(user, req.body);
      const result = await this.users.save(user);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: 'Update failed' });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const result = await this.users.delete(+req.params.id);
      if (result.affected === 0) return res.status(404).json({ msg: 'User not found' });
      
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: 'Delete request failed' });
    }
  }

  // --- SOCIAL FEED LOGIC ---

  static async getPersonalizedFeed(req: Request, res: Response) {
    const userId = (req as any).userId;
    const limit = Number(req.query.limit) || 10;
    const skip = Number(req.query.offset) || 0;

    if (!userId) return res.status(400).json({ msg: 'Auth required' });

    try {
      const me = await this.users.findOne({
        where: { id: userId },
        relations: ['following'],
      });

      if (!me) return res.status(404).json({ msg: 'User not found' });

      const followingIds = me.following.map(f => f.id);
      
      // If not following anyone, return empty feed early
      if (followingIds.length === 0) {
        return res.json({ posts: [], meta: { limit, skip } });
      }

      const feedPosts = await this.posts
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.author', 'author')
        .leftJoinAndSelect('p.likes', 'like')
        .leftJoinAndSelect('p.hashtags', 'hashtag')
        .where('p.authorId IN (:...followingIds)', { followingIds })
        .orderBy('p.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      // Flat mapping for a cleaner frontend consumption
      const formatted = feedPosts.map(p => ({
        id: p.id,
        text: p.content,
        date: p.createdAt,
        author: { id: p.author.id, name: `${p.author.firstName} ${p.author.lastName}` },
        likes: p.likes.length,
        tags: p.hashtags.map(t => t.tag),
      }));

      return res.json({ posts: formatted, meta: { limit, skip } });
    } catch (err) {
      return res.status(500).json({ error: 'Feed retrieval failed' });
    }
  }

  static async getFollowers(req: Request, res: Response) {
    const uid = +req.params.id;
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    try {
      const exists = await this.users.findOne({ where: { id: uid } });
      if (!exists) return res.status(404).json({ msg: 'User not found' });

      const [list, count] = await this.users
        .createQueryBuilder('u')
        .innerJoin('u.following', 'target', 'target.id = :uid', { uid })
        .select(['u.id', 'u.firstName', 'u.lastName', 'u.email'])
        .orderBy('u.id', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return res.json({ followers: list, total: count });
    } catch (err) {
      return res.status(500).json({ error: 'Server error fetching followers' });
    }
  }

  static async getUserActivities(req: Request, res: Response) {
    const uid = +req.params.id;
    const { type, startDate, endDate, limit = 10, offset = 0 } = req.query;

    try {
      const q = this.activities
        .createQueryBuilder('act')
        .leftJoinAndSelect('act.user', 'u')
        .where('act.userId = :uid', { uid })
        .orderBy('act.createdAt', 'DESC');

      // Add dynamic filters if present in query
      if (type && Object.values(ActivityType).includes(type as ActivityType)) {
        q.andWhere('act.type = :type', { type });
      }

      if (startDate) q.andWhere('act.createdAt >= :startDate', { startDate });
      if (endDate) q.andWhere('act.createdAt <= :endDate', { endDate });

      const [items, total] = await q
        .skip(Number(offset))
        .take(Number(limit))
        .getManyAndCount();

      return res.json({ total, activities: items });
    } catch (err) {
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  static async followUser(req: Request, res: Response) {
    const meId = (req as any).userId;
    const targetId = +req.params.id;

    if (meId === targetId) return res.status(400).json({ msg: "Cannot follow yourself" });

    try {
      const me = await this.users.findOne({ where: { id: meId }, relations: ['following'] });
      const target = await this.users.findOneBy({ id: targetId });

      if (!me || !target) return res.status(404).json({ msg: "User not found" });
      
      // Check if already following to prevent duplicates
      if (me.following.some(u => u.id === target.id)) {
        return res.status(400).json({ msg: "Already following" });
      }

      me.following.push(target);
      await this.users.save(me);

      // Log the follow activity
      await this.activities.save({ 
        userId: me.id, 
        type: ActivityType.FOLLOWED, 
        referenceId: target.id 
      });

      return res.status(200).json({ status: "success" });
    } catch (err) {
      return res.status(500).json({ error: 'Follow operation failed' });
    }
  }
}