import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinTable, 
  OneToMany 
} from 'typeorm';
import { User } from './User';
import { Hashtag } from './Hashtag';
import { Like } from './Like';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  // Link back to the user who wrote this
  @ManyToOne(() => User, (u) => u.posts, { onDelete: 'CASCADE' })
  author: User;

  // Junction table for tags - we handle the 'owner' side here
  @ManyToMany(() => Hashtag, (h) => h.posts, { cascade: true })
  @JoinTable({ name: 'post_hashtags' })
  hashtags: Hashtag[];

  @OneToMany(() => Like, (l) => l.post)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}