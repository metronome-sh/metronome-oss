import { faker } from '@faker-js/faker';
import { env } from '@metronome/env';
import fetch from 'node-fetch';

import { generateRemixFunction, generateRequest, generateWebVital } from './mocks';
import { generatePageview } from './mocks/pageviews';

const postData = async () => {
  // prettier-ignore
  const data = faker.helpers.arrayElement([
    [generateRequest('loader'), generateRemixFunction('loader')],
    [generateRequest('action'), generateRemixFunction('action')],
    [generateWebVital('fcp'), generateWebVital('lcp'), generateWebVital('cls'), generateWebVital('fid'), generateWebVital('ttfb'), generateWebVital('inp')],
    [generatePageview()]
  ]);

  try {
    await fetch(`http://127.0.0.1:${env.app().port}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ApiKey: env.producer().apiKey!,
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error producing seed data:', error);
  }
};

let warmedUp = false;

const postWithRandomInterval = async () => {
  // wait 30 seconds before starting to post data
  if (!warmedUp) {
    await new Promise((resolve) => setTimeout(resolve, 30000));
    warmedUp = true;
  }

  if (!env.producer().apiKey) return;
  await postData();
  const randomDelay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000; // Random delay between 1 and 5 seconds
  setTimeout(postWithRandomInterval, randomDelay);
};

postWithRandomInterval();
