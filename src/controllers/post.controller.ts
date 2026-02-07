import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { User } from '../entities/User';
import { Activity, ActivityType } from '../entities/Activity';

export class PostController {
  // Shorter repo names - easier to type
  private static posts = AppDataSource.getRepository(Post);
  private static tags = AppDataSource.getRepository(Hashtag);
  private static users = AppDataSource.getRepository(User);
  private static activities = AppDataSource.getRepository(Activity);

  static async create(req: Request, res: Response) {
    try {
      const { content, hashtags } = req.body;
      const uid = (req as any).userId; 

      const user = await this.users.findOneBy({ id: uid });
      if (!user) return res.status(404).json({ msg: 'User not found' });

      const newPost = new Post();
      newPost.content = content;
      newPost.author = user;

      // Logic for processing hashtags from array
      if (hashtags && Array.isArray(hashtags)) {
        newPost.hashtags = [];
        for (let t of hashtags) {
          // clean up tag: remove # and go lowercase for consistency
          const cleaned = t.replace(/^#/, '').toLowerCase();
          let tagObj = await this.tags.findOneBy({ tag: cleaned });

          if (!tagObj) {
            tagObj = this.tags.create({ tag: cleaned });
            await this.tags.save(tagObj);
          }
          newPost.hashtags.push(tagObj);
        }
      }

      const savedPost = await this.posts.save(newPost);

      // Track the activity - vital for the feed/audit
      await this.activities.save({
        userId: user.id,
        type: ActivityType.POST_CREATED,
        referenceId: savedPost.id
      });

      return res.status(201).json(savedPost);
    } catch (err) {
      console.error("Post Creation Failed:", err);
      return res.status(500).json({ error: "Could not create post" });
    }
  }

  static async getByHashtag(req: Request, res: Response) {
    try {
      const { tag } = req.params;
      const limit = Number(req.query.limit) || 10;
      const skip = Number(req.query.offset) || 0;
      
      const searchTag = tag.replace(/^#/, '').toLowerCase();

      const results = await this.posts
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.author', 'u')
        .leftJoinAndSelect('p.likes', 'l')
        .leftJoinAndSelect('p.hashtags', 'h')
        .where('h.tag = :searchTag', { searchTag })
        .orderBy('p.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      // mapping to a cleaner response for the frontend
      const data = results.map(p => ({
        id: p.id,
        content: p.content,
        ts: p.createdAt,
        user: {
          id: p.author.id,
          name: `${p.author.firstName} ${p.author.lastName}`.trim(),
        },
        likes: p.likes.length,
        tags: p.hashtags.map(h => h.tag),
      }));

      return res.json({ posts: data, meta: { limit, skip } });
    } catch (err) {
      return res.status(500).json({ error: "Search by hashtag failed" });
    }
  }

  static async getAll(_req: Request, res: Response) {
    try {
      // Basic fetch - might need pagination later if DB grows
      const allPosts = await this.posts.find({ 
        relations: ['author', 'hashtags', 'likes'] 
      });
      res.json(allPosts);
    } catch (err) {
      res.status(500).json({ error: "Fetch error" });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const post = await this.posts.findOne({ 
        where: { id }, 
        relations: ['author', 'hashtags', 'likes'] 
      });

      if (!post) return res.status(404).json({ msg: 'Post not found' });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to load post" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const del = await this.posts.delete(req.params.id);
      if (del.affected === 0) return res.status(404).json({ msg: 'Post not found' });
      
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: "Delete failed" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const targetId = parseInt(req.params.id);
      const post = await this.posts.findOne({
        where: { id: targetId },
        relations: ['hashtags'],
      });

      if (!post) return res.status(404).json({ msg: 'Post not found' });

      // Only update content if it's actually passed
      if (req.body.content) {
        post.content = req.body.content;
      }

      // Refresh tags if provided
      if (req.body.hashtags && Array.isArray(req.body.hashtags)) {
        post.hashtags = [];
        for (let t of req.body.hashtags) {
          const name = String(t).replace(/^#/, '').toLowerCase();
          let existingTag = await this.tags.findOneBy({ tag: name });

          if (!existingTag) {
            existingTag = this.tags.create({ tag: name });
            await this.tags.save(existingTag);
          }
          post.hashtags.push(existingTag);
        }
      }

      const updated = await this.posts.save(post);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Update failed" });
    }
  }
}