/* eslint-disable no-var */
import mongoose from 'mongoose';

// Ensure this file is treated as a module
export {};

declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;
}
