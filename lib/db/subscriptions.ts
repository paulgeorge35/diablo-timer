import sql from './index';

export const addSubscription = async (subscription: string) => {
  const result = await sql`INSERT INTO subscriptions (subscription) VALUES (${subscription})`;
  return result;
};

export const getSubscription = async (id: number) => {
  const result = await sql`SELECT * FROM subscriptions WHERE id = ${id}`;
  return result;
};

export const getAllSubscriptions = async () => {
  const result = await sql`SELECT * FROM subscriptions`;
  return result;
};

export const deleteSubscription = async (id: number) => {
  const result = await sql`DELETE FROM subscriptions WHERE id = ${id}`;
  return result;
}; 

export const deleteAllSubscriptions = async () => {
  const result = await sql`DELETE FROM subscriptions`;
  return result;
};
