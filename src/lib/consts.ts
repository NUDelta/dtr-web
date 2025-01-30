import process from 'node:process';

export const revalidateTime = Number.isNaN(Number(process.env.REVALIDATE_TIME))
  ? 60
  : Number(process.env.REVALIDATE_TIME);
