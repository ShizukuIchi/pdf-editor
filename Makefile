
build:
	docker build . -t pdf-editor

run:
	docker run -d -it --rm -p 5000:5000 pdf-editor
	xdg-open http://localhost:5000 | true