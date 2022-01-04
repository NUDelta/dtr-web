export const revalidateTime = isNaN(Number(process.env.REVALIDATE_TIME)) ?
60 : Number(process.env.REVALIDATE_TIME);
