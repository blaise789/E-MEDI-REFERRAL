import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileService } from './file.service';

@Controller('file')
@ApiTags('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const { fileContent, file } = await this.fileService.getFile(id);

    if (!fileContent) {
      res.status(404).send('File not found');
      return;
    }
    res.setHeader('Content-Type', file.type);
    res.setHeader(
      'Content-Disposition',
      `inline; filename=${file.originalName}`,
    );
    res.send(fileContent);
  }
}
