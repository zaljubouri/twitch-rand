FROM node:14-alpine AS build

WORKDIR /
COPY . .
RUN yarn --immutable
RUN yarn workspace client-app run build
RUN yarn workspace twitch-rand run build
RUN rm client-app/package.json
RUN yarn --production

FROM node:14-alpine

# Required for uWS
RUN apk update && apk add --no-cache gcompat

WORKDIR /
COPY --from=build /client-app/build/ ./client-app/build
COPY --from=build /server/dist/ ./server/dist
COPY --from=build /node_modules/ ./server/node_modules

EXPOSE 8080 8081

CMD ["node", "server/dist/bot.js"]
