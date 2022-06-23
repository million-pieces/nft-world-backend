/* eslint-disable no-bitwise */
import { Logger } from '@nestjs/common';

import { exec } from 'child_process';

/**
 * Utils service.
 *
 * Runs string shell commands.
 */
export class ShellCommandUtil {
  private static readonly logger = new Logger();

  /**
   * Executes shell command and return promise.
   *
   * @param cmd string shell command
   * @returns shell command promise
   */
  static async exec(cmd: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          this.logger.warn(error.message);
          reject(stderr);
        }
        resolve(stdout);
      });
    });
  }
}
