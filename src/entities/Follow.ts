import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  JoinColumn,
  Unique 
} from "typeorm";
import { User } from "./User";

@Entity('follows')
// unique constraint to prevent double-following the same person
@Unique(["followerId", "followingId"]) 
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerId: number;

  @Column()
  followingId: number;

  @CreateDateColumn()
  createdAt: Date;

  // The person doing the following
  @ManyToOne(() => User, (u) => u.following)
  @JoinColumn({ name: "followerId" })
  follower: User;

  // The person being followed
  @ManyToOne(() => User, (u) => u.followers)
  @JoinColumn({ name: "followingId" })
  following: User;
}