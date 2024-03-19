---
author: Arga
pubDatetime: 2023-07-02T14:26:00Z
title: Containerization Golang
postSlug: containerization_golang
featured: false
tags:
  - Go
  - Container
  - Docker
ogImage: ""
description: How to build golang container with some optimization and best practices
---

# Containerization Golang

While we build an application with Golang, we need to publish/deploy that application somewhere right? So in this article we will discover how we do it in simple way (not really simple tho)

## Table of contents

## Requirement

For this article you must be require some basic of

- Golang (for building simple Rest API)
- Docker (for building container image)

## TLDR;

Why we need to deploy Golang application into Container Image?

- So we don't say `It's work on my machine`, so everyone can run it properly
- Simple, clean, and we don't put much efford for deployment
- Is that enough? No we gonna learn how to optimize the Image!

## Prepare The Requirements

All you need to install is Docker (one of container runtime that we use in this article)!

Before we get into building steps, here Golang Code that we will use.

```go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

func main() {
	// ? Get port network number
	PORT := os.Getenv("PORT")
	// ? Set default port network number
	if PORT == "" {
		PORT = "8000"
	}
	// ? Endpoint handler
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusTeapot)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "OK"})
	})
	// ? Start http web server
	http.ListenAndServe(fmt.Sprintf("0.0.0.0:%s", PORT), nil)
}
```

Then when you run the application and hit endpoint using _curl_

```sh
curl -s http://localhost:8000
```

It should return json like this

```json
{ "message": "OK" }
```

And finally we can get into Building the application

## Building Image

### Simple build

So like all of us know, when you need to build custom container image (Docker Image), you need to create Dockerfile to put all of your configuration and requirement that you need to build the image.

The Dockerfile is pretty simple and look like this

> We use Alpine based Image because of this image has smaller size than the default one

```dockerfile
FROM golang:alpine
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY *.go ./
RUN go build -o application ./main.go
ARG PORT=8000
EXPOSE ${PORT}
CMD [ "/app/application" ]
```

And you can build it with

```sh
docker build . -t gocontainer:latest
```

Then run the container, and the result of curl will be the same as we expected

```sh
docker run -d -p 8000:8000 gocontainer
curl -s http://localhost:8000 | jq
```

BUT..... wait a minute, try to run this command

```sh
docker images gocontainer --format "{{.Repository}} {{.Tag}} {{.Size}}"
```

and the result is

```sh
gocontainer latest 319MB
```

Damn, we just create _{"message": "OK"}_ endpoint with ~300MB, how we can minimize/improve the image size(?)

> TLDR; We gonna use [Multi Stage Build](#multi-stage-build)

### Multi Stage Build

So what is Multi State build?
Multi State build is the way that often to use for splitting build into individual process in Container World the goals of this method is to reduce the Image artifacts.

> Before Multi Stage build exist, common method to solve this problem is builder-pattern. But, we don't discover this method because this method is too damn hard to understand for beginner like me 🥲

So what make this method difference, so in this case we will split the build into 2 processes

1. Build the application into _Binary File_
2. Attach this Binary File into _Small_ Base Image

We need to modify the _Dockerfile_ just like this

```dockerfile
FROM golang:alpine as Builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY *.go ./
RUN go build -o application ./main.go

FROM alpine:latest
WORKDIR /opt/app
COPY --from=Builder /app/application /opt/app/
ENV PORT 8000
EXPOSE ${PORT}
CMD [ "/opt/app/application" ]
```

Details:

1. For the first stage we add `AS Builder`
2. Create another stage using base image `alpine:latest` as a runtime image \*For smaller size
3. Copy the output binary file `application` into runtime stage
4. Move `ENV` and `EXPOSE` into runtime stage
5. Then run the binary file

Let's compare the difference

```sh
docker images gocontainer --format "{{.Repository}} {{.Tag}} {{.Size}}"
```

The output of the Image is

```sh
gocontainer latest 14.1MB
```

See??? that is why you should using multi stage build as can as possible, because you can save a lot of disk space (if you use cloud, it can be save a lot of money too 💸).

That all i know, hope that help 😉
