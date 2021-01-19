import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return await this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!found) {
      throw new NotFoundException(`task with ${id} not found`);
    }
    return found;
  }
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // const { title, description } = createTaskDto;
    // //we can use both just entity and repository tto create a task
    // //entity
    // const task = new Task();
    // task.title = title;
    // task.description = description;
    // task.status = TaskStatus.OPEN;
    // await task.save();
    // return task;
    return this.taskRepository.createTask(createTaskDto, user);
  }
  async deleteTaskById(id: number, user: User) {
    const result = await this.taskRepository.delete({ id, userId: user.id });
    if (result.affected) {
      return `task ${id}  deleted !!`;
    }
    throw new NotFoundException(`task with id:${id} not found`);
    //above one use delete has better performance,because touch less db
    // const found = await this.getTaskById(id);
    // const result = await this.taskRepository.remove(found);
    // return `task ${id}  deleted !!`;
  }
  async updateTaskStatusById(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
