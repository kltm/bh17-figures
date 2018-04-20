# BH17 Figures

Please see:

https://kltm.github.io/bh17-figures/

Data for generating this:

https://github.com/kltm/bh17-figures/tree/master/data

Color map:

* blue edge = 'worked with on project'
* gray edge = 'wanted to discuss about project'

* #E8747C (red) = "Interoperability and reuse"
* #E8CB74 (yellow) = "Machine learning"
* #74CBE8 (blue) = "Omics integration and accessibility"
* #74E883 (green) = "Software infrastructure"

Calculations:

```bash
sjcarbon@moiraine:~/local/src/git/bh17-figures[master]$:) cat data/person_connectivity_degree_all.json | jq  add/length
9.207207207207206
```

```bash
sjcarbon@moiraine:~/local/src/git/bh17-figures[master]$:) cat data/person_connectivity_degree_on.json | jq  add/length
5.2792792792792795
```

```bash
sjcarbon@moiraine:~/local/src/git/bh17-figures[master]$:) cat data/person_connectivity_degree_with.json | jq  add/length
3.9279279279279278
```
