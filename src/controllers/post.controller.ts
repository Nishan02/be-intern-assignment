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

  private static normalizeTag(raw: string): string {
    return raw.trim().replace(/^#+/, '').trim().toLowerCase();
  }

  private static parseTagsFromContent(content: string): string[] {
    const matches = content.match(/#([A-Za-z0-9_]+)/g) ?? [];
    return matches
      .map((m) => PostController.normalizeTag(m))
      .filter((t) => t.length > 0);
  }

  private static parseInputTags(input: unknown): string[] {
    if (Array.isArray(input)) {
      return input
        .map((v) => PostController.normalizeTag(String(v)))
        .filter((t) => t.length > 0);
    }

    if (typeof input === 'string') {
      return input
        .split(',')
        .map((v) => PostController.normalizeTag(v))
        .filter((t) => t.length > 0);
    }

    return [];
  }

  private static collectTags(content: string, input: unknown): string[] {
    return [...new Set([
      ...PostController.parseInputTags(input),
      ...PostController.parseTagsFromContent(content),
    ])];
  }

  private static async resolveTags(tags: string[]): Promise<Hashtag[]> {
    const resolved: Hashtag[] = [];

    for (const tag of tags) {
      let tagObj = await PostController.tags.findOneBy({ tag });
      if (!tagObj) {
        tagObj = PostController.tags.create({ tag });
        await PostController.tags.save(tagObj);
      }
      resolved.push(tagObj);
    }

    return resolved;
  }

  static async create(req: Request, res: Response) {
    try {
      const { content, hashtags } = req.body;
      const uid = (req as any).userId; 

      const user = await PostController.users.findOneBy({ id: uid });
      if (!user) return res.status(404).json({ msg: 'User not found' });

      const newPost = new Post();
      newPost.content = content;
      newPost.author = user;
      newPost.hashtags = [];

      const normalizedTags = PostController.collectTags(String(content), hashtags);
      if (normalizedTags.length > 0) {
        newPost.hashtags = await PostController.resolveTags(normalizedTags);
      }

      const savedPost = await PostController.posts.save(newPost);

      // Track the activity - vital for the feed/audit
      await PostController.activities.save({
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
      const rawTag =
        (typeof req.params.tag === 'string' && req.params.tag.length > 0)
          ? req.params.tag
          : String(req.query.tag ?? '');
      const limit = Number(req.query.limit) || 10;
      const skip = Number(req.query.offset) || 0;
      
      const searchTag = PostController.normalizeTag(rawTag);
      if (!searchTag) {
        return res.status(400).json({ error: 'Hashtag is required' });
      }

      const results = await PostController.posts
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.author', 'u')
        .leftJoinAndSelect('p.likes', 'l')
        .leftJoinAndSelect('p.hashtags', 'h')
        .where('LOWER(TRIM(h.tag)) = :searchTag', { searchTag })
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
      const allPosts = await PostController.posts.find({ 
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
      const post = await PostController.posts.findOne({ 
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
      const del = await PostController.posts.delete(req.params.id);
      if (del.affected === 0) return res.status(404).json({ msg: 'Post not found' });
      
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: "Delete failed" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const targetId = parseInt(req.params.id);
      const post = await PostController.posts.findOne({
        where: { id: targetId },
        relations: ['hashtags'],
      });

      if (!post) return res.status(404).json({ msg: 'Post not found' });

      // Only update content if it's actually passed
      if (req.body.content) {
        post.content = req.body.content;
      }

      const hasHashtagInput = req.body.hashtags !== undefined;
      const hasContentInput = typeof req.body.content === 'string';

      if (hasHashtagInput || hasContentInput) {
        const normalizedTags = PostController.collectTags(post.content, req.body.hashtags);
        post.hashtags = normalizedTags.length > 0
          ? await PostController.resolveTags(normalizedTags)
          : [];
      }

      const updated = await PostController.posts.save(post);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Update failed" });
    }
  }
}
