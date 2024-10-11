import { HttpStatus, Injectable } from '@nestjs/common';
import { render } from 'ejs';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { FileSystemService } from '../filesystem/filesystem.service';

@Injectable()
export class EjsService {
  constructor(private fileSystemService: FileSystemService) {}

  public render(content: string, data: any): string {
    return render(content, data);
  }

  public async sendView(
    res: Response,
    relativePath: string,
    data: Record<string, any> = {},
    status: HttpStatus = HttpStatus.OK,
  ): Promise<Response> {
    const html = await this.renderFileToString(relativePath, data);
    return res.status(status).send(html);
  }

  public async send404(res: Response, relativePath: string): Promise<Response> {
    return this.sendView(
      res,
      '404',
      {
        url: relativePath,
      },
      HttpStatus.NOT_FOUND,
    );
  }

  public async renderFileToString(
    relativePath: string,
    data: any,
  ): Promise<string> {
    const template = await this.loadView(relativePath);
    return this.render(template, data);
  }

  public async loadView(relativePath: string) {
    const pathWithExtension = !relativePath.endsWith('.ejs')
      ? `${relativePath}.ejs`
      : relativePath;
    const path = this.fileSystemService.parseRelativePath(
      `views/${pathWithExtension}`,
    );
    try {
      const result = readFileSync(path, 'utf8');
      return (result || '') as string;
    } catch (err: any) {
      console.error(err.message);
    }
    return '';
  }
}
