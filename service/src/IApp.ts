import express from 'express';
import http from 'http';

export interface IApp {
   listen(port?: number): Promise<http.Server>;
   get app(): express.Application;
}
