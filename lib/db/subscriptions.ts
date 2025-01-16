import db from './index';

export const addSubscription = (subscription: string) => {
  const stmt = db.prepare('INSERT INTO subscriptions (subscription) VALUES (?)');
  return stmt.run(subscription);
};

export const getSubscription = (id: number) => {
  const stmt = db.prepare('SELECT * FROM subscriptions WHERE id = ?');
  return stmt.get(id);
};

export const getAllSubscriptions = () => {
  const stmt = db.prepare('SELECT * FROM subscriptions');
  return stmt.all();
};

export const deleteSubscription = (id: number) => {
  const stmt = db.prepare('DELETE FROM subscriptions WHERE id = ?');
  return stmt.run(id);
}; 

export const deleteAllSubscriptions = () => {
  const stmt = db.prepare('DELETE FROM subscriptions');
  return stmt.run();
};