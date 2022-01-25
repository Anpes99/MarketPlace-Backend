# MarketPlace backend

## features:

- REST api endpoints for users, normal and premium items, logging in/out, subscribing, reset for tests.

- Automatic email to users who have favourited an item when the item is updated

### api/items query param options:

- location //
- category // category=category_name
- premium // gets only premium items
- limit // items per page
- fields // choose item fields to return
- sort // example descending order sort=-category
- random // shuffles premium items
- page

- example:
- api/items?page=1&location=Uusimaa&category=ajoneuvot&premium=true&limit=5000&fields=name,location&sort=-category&random=true
