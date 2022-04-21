import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Unique, Index } from 'typeorm';

@Entity()
@Unique(['username'])
@Index(['passwordHash'])
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    username: string;

    @Column()
    passwordHash: string;

    @Column({ default: false })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}