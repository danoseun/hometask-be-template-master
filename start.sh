#!/bin/bash
docker build -t deelchallengeapi .
docker run -it -p 3001:3001 deelchallengeapi