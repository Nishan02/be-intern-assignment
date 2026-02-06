import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Post } from '../entities/Post';
import { Hashtag } from '../entities/Hashtag';
import { Activity, ActivityType } from '../entities/Activity';

export class PostController {
  static delete(arg0: string, authenticate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined, delete: any) {
      throw new Error("Method not implemented.");
  }
  static create(arg0: string, authenticate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined, arg2: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined, create: any) {
      throw new Error("Method not implemented.");
  }
  static getOne(arg0: string, getOne: any) {
      throw new Error("Method not implemented.");
  }
  static getAll(arg0: string, getAll: any) {
      throw new Error("Method not implemented.");
  }
  private static postRepo = AppDataSource.getRepository(Post);
  private static hashRepo = AppDataSource.getRepository(Hashtag);

  static async createPost(req: Request, res: Response) {
    try {
      const { content, hashtags } = req.body;
      const authorId = (req as any).userId; // Set by your auth middleware

      const post = this.postRepo.create({
        content,
        author: { id: authorId }
      });

      if (hashtags && Array.isArray(hashtags)) {
        post.hashtags = await Promise.all(
          hashtags.map(async (name: string) => {
            const cleanTag = name.replace('#', '').toLowerCase();
            let tag = await this.hashRepo.findOneBy({ tag: cleanTag });
            if (!tag) tag = await this.hashRepo.save(this.hashRepo.create({ tag: cleanTag }));
            return tag;
          })
        );
      }

      const savedPost = await this.postRepo.save(post);

      // Log the activity
      await AppDataSource.getRepository(Activity).save({
        userId: authorId,
        type: ActivityType.POST_CREATED,
        referenceId: savedPost.id
      });

      return res.status(201).json(savedPost);
    } catch (error) {
      return res.status(500).json({ message: 'Post creation failed', error });
    }
  }
  
  // Implement other methods (getById, delete) using this same static pattern
}