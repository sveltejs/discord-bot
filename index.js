import polka from 'polka'

polka()
    .get('/:name', (req, res) => {
        res.end(`Hello there, ${req.params.name}!`);
    })
    .listen(3000, () => {
        console.log(`> Running on localhost:3000`);
    });