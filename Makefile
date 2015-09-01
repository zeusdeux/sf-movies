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
	@$(BIN)/browserify -t reactify -t envify $(MAIN) -o $@

$(PUBLICCSS)/style.min.css: $(PUBLICCSS)/style.css
	@$(BIN)/cleancss $^ -o $@ -d

clean:
	@$(RM) $(PUBLICCSS)/style.min.css
	@$(RM) $(PUBLICJS)/bundle.js $(PUBLICJS)/bundle.min.js

.PHONY: all clean

# git pull --rebase origin master && git reset --hard origin/master && pm2 delete schema-check && NODE_ENV=production PORT=8008 DEBUG=schema-check:* pm2 start -x ./bin/server --name "schema-check"
