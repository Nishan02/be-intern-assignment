import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique } from "typeorm";
import { User } from "./User";

@Entity()
@Unique(["followerId", "followingId"]) // Prevents duplicate follows
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerId: number;

  @Column()
  followingId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  follower: User;

  @ManyToOne(() => User)
  following: User;
}