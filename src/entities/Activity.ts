import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

export enum ActivityType {
  POST_CREATED = "POST_CREATED",
  LIKED = "LIKED",
  FOLLOWED = "FOLLOWED",
  UNFOLLOWED = "UNFOLLOWED",
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "varchar" })
  type: ActivityType;

  @Column()
  referenceId: number; // This stores the ID of the Post or the User followed

  @CreateDateColumn()
  createdAt: Date;
}