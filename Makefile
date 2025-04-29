DOCKER_REPO := ttl.sh
DOCKER_IMAGE := caddycontrol
DOCKER_TAG := 5m

push:
	docker build --platform linux/amd64 -t $(DOCKER_REPO)/$(DOCKER_IMAGE):$(DOCKER_TAG) .
	docker push $(DOCKER_REPO)/$(DOCKER_IMAGE):$(DOCKER_TAG)

.PHONY: push