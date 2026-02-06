static async getFeed(req: Request, res: Response) {
  const userId = (req as any).userId;
  const { limit = 10, offset = 0 } = req.query;

  const user = await AppDataSource.getRepository(User).findOne({
    where: { id: userId },
    relations: ['following']
  });

  const followingIds = user?.following.map(f => f.id) || [];

  if (followingIds.length === 0) return res.json({ posts: [], total: 0 });

  const [posts, total] = await AppDataSource.getRepository(Post).findAndCount({
    where: { author: { id: In(followingIds) } },
    relations: ['author', 'hashtags'],
    order: { createdAt: 'DESC' },
    take: Number(limit),
    skip: Number(offset)
  });

  return res.json({ data: posts, total });
}