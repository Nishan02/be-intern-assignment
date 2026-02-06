import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Post } from "../entities/Post";

const postRepository = AppDataSource.getRepository(Post);

export class PostController {
  static async getAll(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const [posts, total] = await postRepository.findAndCount({
      relations: ["author"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    res.json({ data: posts, total, limit, offset });
  }

  static async create(req: Request, res: Response) {
    const post = postRepository.create(req.body);
    await postRepository.save(post);
    res.status(201).json(post);
  }

  static async getOne(req: Request, res: Response) {
    const post = await postRepository.findOne({ 
        where: { id: parseInt(req.params.id) },
        relations: ["author"] 
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  }

  static async update(req: Request, res: Response) {
    const post = await postRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    postRepository.merge(post, req.body);
    await postRepository.save(post);
    res.json(post);
  }

  static async delete(req: Request, res: Response) {
    const result = await postRepository.delete(req.params.id);
    if (result.affected === 0) return res.status(404).json({ message: "Post not found" });
    res.status(204).send();
  }
}