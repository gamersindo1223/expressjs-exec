import express from 'express'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import serveIndex from 'serve-index'
import os from 'os'
import fs from 'fs'
import bytes from 'bytes'
const app = express()
const tmpdir = os.tmpdir()
app.use(express.json())
dotenv.config()


app.use('/dir', serveIndex(tmpdir,  {'icons': true}))
app.use(express.static(tmpdir));
let index = 0
app.all('/', (req, res) => {
    const { cmd, auth } = req.query
    if (cmd) {
        const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/; // Stricter Base64 regex

        if (process.env.AUTH) {
            if (!auth || process.env.AUTH != auth) return res.send("Invalid auth code")
        }
    const decodedCmd = base64Regex.test(cmd) ? atob(cmd) : cmd
        exec(`cd ${tmpdir} && ` + decodedCmd, (error, stdout, stderr) => {
            if (error) {
                res.status(500).send({ error: stderr.toString() }); // Send error with status code
            } else {
                res.send(stdout.toString());
            }            
        });
        return
    }
	const status = {}
	const used = process.memoryUsage()
	for (let key in used) status[key] = formatSize(used[key])
	
	const totalmem = os.totalmem()
	const freemem = os.freemem()
	status.memoryUsage = `${formatSize(totalmem - freemem)} / ${formatSize(totalmem)}`
	
	res.json({
		message: 'Hello World!',
		uptime: new Date(process.uptime() * 1000).toUTCString().split(' ')[4],
		status
	})
    index++
})
const port = process.env.PORT || process.env.SERVER_PORT || 7860
app.listen(port, async() => {
    console.log(`Example app listening on port ${port}`)
    fs.mkdir(`${tmpdir}/result`,
    (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
    })
})

function formatSize(num) {
	return bytes(+num || 0, { unitSeparator: ' ' })
}