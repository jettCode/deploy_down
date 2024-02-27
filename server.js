const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/download', async (req, res) => {
    try {
        const url = req.query.url;
        const quality = req.query.quality || 'highest';
        const info = await ytdl.getInfo(url);
        let format;

        if (quality === 'highest') {
            format = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        } else if (quality === 'lowest') {
            format = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
        } else {
            const filter = info.formats.filter(format => format.qualityLabel && format.qualityLabel.includes(quality) && format.container === 'mp4' && format.hasAudio);
            if (filter.length > 0) {
                format = filter[0];
            } else {
                return res.status(400).send('Formato de vídeo selecionado não disponível');
            }
        }

        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        res.header('Content-Disposition', `attachment; filename="${title}.${format.container}"`);
        ytdl(url, {
            format: format
        }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao baixar o vídeo');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
