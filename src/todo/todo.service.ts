import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  create(userId: string, dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create({
      title: dto.title,
      description: dto.description ?? '',
      completed: false,
      userId,
    });
    return this.todoRepository.save(todo);
  }

  findAll(userId: string): Promise<Todo[]> {
    return this.todoRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id, userId } });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async update(userId: string, id: string, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(userId, id);
    Object.assign(todo, dto);
    return this.todoRepository.save(todo);
  }

  async remove(userId: string, id: string): Promise<void> {
    const todo = await this.findOne(userId, id);
    await this.todoRepository.remove(todo);
  }
}
