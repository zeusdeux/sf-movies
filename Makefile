# folders
NM = ./node_modules
BIN = $(NM)/.bin
VIEWS = ./views
PUBLIC = ./public
PUBLICJS = $(PUBLIC)/js
PUBLICCSS = $(PUBLIC)/css

# files
MAIN = $(VIEWS)/main.jsx
MAPFILE = bundle.min.map

all: $(PUBLICJS)/bundle.min.js $(PUBLICCSS)/style.min.css

$(PUBLICJS)/bundle.min.js: $(PUBLICJS)/bundle.js
	@$(BIN)/uglifyjs $^ -o $@ -c -m --source-map $(PUBLICJS)/$(MAPFILE) --source-map-url ./$(MAPFILE) --comments --stats

$(PUBLICJS)/bundle.js: $(VIEWS)/* $(NM)/*
	@$(BIN)/browserify -t envify $(MAIN) -o $@

$(PUBLICCSS)/style.min.css: $(PUBLICCSS)/style.css
	@$(BIN)/cleancss $^ -o $@ -d

clean:
	@$(RM) $(PUBLICCSS)/style.min.css
	@$(RM) $(PUBLICJS)/bundle.js $(PUBLICJS)/bundle.min.js

watch:
	fswatch -o views/ public/ | xargs -n1 -I% make

test:
	GEOCODING_API_KEY=AIzaSyA-G_zjmZifvfrpS8t8tcrg2pS0u5fpOVI NODE_ENV=production $(BIN)/mocha tests/*.js --harmony_arrow_functions --harmony_rest_parameters -r should --bail

.PHONY: all clean watch test
