import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtUserPayload } from '../common/decorators/current-user.decorator';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateTodoDto) {
    return this.todoService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtUserPayload) {
    return this.todoService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.todoService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todoService.update(user.sub, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    await this.todoService.remove(user.sub, id);
    return { message: 'Todo deleted successfully.' };
  }
}
