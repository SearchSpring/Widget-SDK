# SearchSpring eCommerce Widget SDK

The SearchSpring eCommerce widget SDK provides the framework for building your own frontend website widgets. This SDK also includes example widgets that you can play with and customize to integrate SearchSpring onto your own website. 

## First-time setup

1. Install the newest versions of NodeJS and NPM
2. Run `npm install` from this directory

## Customize your own widget

1. Run `npm run develop` from this directory - a browser window should open and display a list of all widgets in this repository
2. Click on 'simple' and then 'search' to view the simple search widget
3. Open 'widgets/simple/search/src/main.js', edit some HTML, and save the file to see the live changes

## Publish your custom widget

Custom widgets must be hosted on your server. Here's how to do that:

1. Run `npm run build` from this directory
2. Publish the 'dist' directory to your server
3. Add this script to every page of your website: `<script src="/dist/widgets.js" searchspring-id="[YOUR-SITE-ID]"></script>`
  1. **[YOUR-SITE-ID]** can be found on the [My Account Page of the SearchSpring Management Console](https://smc.searchspring.net/management/account/index)
4. Add this where you would like your custom search results to appear: `<searchspring widget="simple/search" parameter="[YOUR-SEARCH-PARAMETER]"></searchspring>`
  1. **[YOUR-SEARCH-PARAMETER]** is the URL query parameter that identifies your search term

# Questions or Comments?

Please let us know by [creating in an issue on GitHub](https://github.com/SearchSpring/Widget-SDK/issues)
