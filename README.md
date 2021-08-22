# ghost-clean

A quick script to clean Ghost servers from unused images.

## Installation

```
$> git clone https://github.com/paulloz/ghost-clean.git
$> cd ghost-clean
$> npm install
$> sudo npm link
```

## Usage

Create a custom integration on your Ghost server and copy both the **Content API Key** and the **Admin API Key**.  
From your Ghost installation folder (where your `config.production.json` file lives), run:
```
$> ghost-clean --content-key CONTENT_API_KEY --admin-key ADMIN_API_KEY
```
If you prefer to store your configuration in a configuration file, put a file with the following structure in your Ghost installation folder and name it `.ghost-clean.config.json`.  
```json
{
    "content-key": "CONTENT_API_KEY",
    "admin-key": "ADMIN_API_KEY"
}
```
Either way, you'll be prompted for confirmation before files are actually removed.  


:warning: Always make backups before running cleanup scripts.  
