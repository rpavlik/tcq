export const DATABASE_ID = 'tcq';
export const COLLECTION_ID = 'items';

import { Document, MongoClient, WithId } from 'mongodb';
import * as secrets from './secrets';
import Meeting from '../shared/Meeting';

const meetingsCollection = getMeetingsCollection();

export async function updateMeeting(meeting: Meeting) {
  let collection = await meetingsCollection;
  await collection.replaceOne({ id: meeting.id }, meeting);
}

export async function getMeeting(meetingId: string) {
  let collection = await meetingsCollection;

  return (await collection.findOne({ id: meetingId })) as Meeting & WithId<Document>;
}

export async function createMeeting(meeting: Meeting) {
  let collection = await meetingsCollection;

  return collection.insertOne(meeting);
}

export async function getMeetingsCollection() {
  const mdbClient = new MongoClient(secrets.MONGODB_URL_SECRET);
  return mdbClient.db(DATABASE_ID).collection(COLLECTION_ID);
}
