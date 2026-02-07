import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToMany 
} from "typeorm";
import { Post } from "./Post";

@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  // unique constraint helps with 'findOrCreate' logic in the controller
  @Column({ unique: true })
  tag: string;

  // Many-to-many is defined here but the 'owner' is usually the Post side
  @ManyToMany(() => Post, (p) => p.hashtags)
  posts: Post[];
}