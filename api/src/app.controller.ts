import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { editFileName, imageFileFilter } from './utils/file-uploading';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { UsersService } from './users/users.service';
import { JwtAuthGuard } from './auth/jwt.guards';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
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
      const url = `${process.env.IMG_URL}${response.filename}`;
      const user: any = req.user;
      await this.userService.updatePicture(user.username, url);
    }
    return response;
  }

  @Get('images/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './files' });
  }
}
