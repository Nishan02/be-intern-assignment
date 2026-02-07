import { 
  Entity, 
  PrimaryColumn, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn 
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity('likes')
export class Like {
  // Composite PK: prevents duplicate likes automatically
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => User, (u) => u.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Post, (p) => p.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "postId" })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}