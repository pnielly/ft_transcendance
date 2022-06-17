import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { editFileName, imageFileFilter } from './utils/file-uploading';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { UsersService } from './users/users.service';
import { Request } from 'express';
import { Public } from './utils/public-route';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    if (response) {
      const url = `${process.env.URL_BACK}/api/images/${response.filename}`;
      const user: any = req.user;
      await this.userService.update(user.id, { avatar: url });
    }
    return response;
  }

  @Get('images/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './files' });
  }
}
