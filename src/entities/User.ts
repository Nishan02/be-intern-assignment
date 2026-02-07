import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToMany, 
  ManyToMany, 
  JoinTable 
} from 'typeorm';
import { Post } from './Post';
import { Like } from './Like';
import { Activity } from './Activity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  // Relation to posts authored by this user
  @OneToMany(() => Post, (p) => p.author)
  posts: Post[];

  // Self-referencing relationship for the follow system
  @ManyToMany(() => User, (u) => u.followers)
  @JoinTable({
    name: 'follows',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' }
  })
  following: User[];

  @ManyToMany(() => User, (u) => u.following)
  followers: User[];

  @OneToMany(() => Like, (l) => l.user)
  likes: Like[];

  @OneToMany(() => Activity, (a) => a.user)
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}