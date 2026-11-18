# monthtotal

The script our two-person finance team runs once a month: it adds up the amounts in the bank's CSV export, which we download by hand from the bank's website.

```sh
node -e "import('./src/total.mjs').then(m => console.log(m.totalOf(require('fs').readFileSync('export.csv', 'utf8'))))"
```

The export is always `date,description,amount`, one header row, amounts in euros with a dot for decimals. The bank has not changed it since 2019.
