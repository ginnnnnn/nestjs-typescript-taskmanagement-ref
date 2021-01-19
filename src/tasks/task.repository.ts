import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;
    const query = this.createQueryBuilder('task');
    //params is optional bu it wiill refer to query variable name task.status
    query.where('task.userId= :userId', { userId: user.id });
    if (status) {
      //second arg is the value of the :status ,and it's an object
      query.andWhere('task.status= :status', { status });
    }
    if (search) {
      //there  is  also a method call where, but it will overwrite each other
      // LIKE is a partial match it can toren some white spach at front or back
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
        //this  %search% will make it more torenable like nest can be nestjs
      );
    }
    const tasks = await query.getMany();
    return tasks;
  }
  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    //we can use both just entity and repository tto create a task
    //entity
    const task = new Task();
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    await task.save();
    // return task without user info
    delete task.user;
    return task;
  }
}
