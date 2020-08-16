import bodyParser from 'body-parser';
import cors from 'cors';
import express, {
	Application,
	NextFunction,
	Request,
	Response,
	Router,
} from 'express';
import expressJwt from 'express-jwt';
import * as jwt from 'jsonwebtoken';
// import cookieParser from 'cookie-parser';

const userDatabase = [
	{ id: '1', email: 'test@domain', password: '123456' },
	{ id: '2', email: 'user@domain', password: '123123' },
];

const app: Application = express();

app.use(bodyParser.json());

var corsOptions: cors.CorsOptions = {
	// origin: function (origin: string, callback: any) {
	// 	var isWhitelisted = config.originsWhitelist.indexOf(origin) !== -1;
	// 	callback(null, isWhitelisted);
	// },
	origin: 'http://localhost:4200',
	methods: ['GET', 'PUT', 'POST', 'PATCH', 'SEARCH', 'DELETE'], // Because otherwise 'SEARCH' failed with cors. We need 'SEARCH' method because GET can't have a body
	credentials: true,
};

app.use(cors(corsOptions));

const key = 'secretsquirrel';

// app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
// 	if (err.name === 'UnauthorizedError') {
// 		res.status(401).send('invalid token...');
// 	}
// });
app.route('/api/login').post(loginRoute);

const router = Router();
router.use(
	expressJwt({
		secret: key,
		algorithms: ['HS256'],
		credentialsRequired: false,
	}),
	(err: any, _req: Request, res: Response, _next: NextFunction) => {
		if (err.name === 'UnauthorizedError') {
			res.status(401).send('invalid token...');
		}
	}
);
router.get('/user', usersRoute);
app.use('/test', router);

// const usersRoute1 = app.route('/api/users');
// usersRoute1.
// .get(
// 	expressJwt({
// 		secret: key,
// 		algorithms: ['HS256'],
// 		credentialsRequired: false,
// 	}),
// 	(err: any, _req: Request, res: Response, _next: NextFunction) => {
// 		if (err.name === 'UnauthorizedError') {
// 			res.status(401).send('invalid token...');
// 		}
// 	},
// 	usersRoute
// );

// const key = fs.readFileSync('./demos/private.key');
const expiresInSec = 30;

export function loginRoute(req: Request, res: Response) {
	const email = req.body.email;
	const password = req.body.password;
	console.log({ email, password });

	if (validateEmailAndPassword(email, password)) {
		const userId = findUserIdForEmail(email);
		console.log({ userId });

		const jwtBearerToken = jwt.sign({ userId: userId }, key, {
			expiresIn: expiresInSec,
			subject: userId,
		});
		console.log(jwtBearerToken);
		res.json({ jwt: jwtBearerToken, expiresIn: expiresInSec });

		// send the JWT back to the user
		// TODO - multiple options available
	} else {
		// send status 401 Unauthorized
		res.sendStatus(401);
	}
}

export function usersRoute(req: Request, res: Response) {
	const [, jwtToken] = req.headers.authorization?.split(' ') ?? []; // the fromat of the header id 'bearer <token>'
	console.log({ jwtToken });

	console.log({ user: (req as any).user });

	// const jwtToken = req.body.jwt;

	try {
		// const payload = jwt.verify(jwtToken, key) as {
		// 	userId: string;
		// 	iat: number;
		// 	exp: number;
		// 	sub: string;
		// };
		// console.log({ payload });

		// // generate a new token
		// const jwtBearerToken = jwt.sign({ userId: payload.userId }, key, {
		// 	expiresIn: expiresInSec,
		// 	subject: payload.userId,
		// });
		res.json({
			users: userDatabase,
			// jwt: jwtBearerToken,
			// expiresIn: expiresInSec,
		});
	} catch (error) {
		res.sendStatus(401);
	}
}

function validateEmailAndPassword(email: string, password: string) {
	return userDatabase.some(
		(item) => item.email === email && item.password === password
	);
}

function findUserIdForEmail(email: string) {
	return userDatabase.find((item) => item.email === email)?.id;
}

// start the Express server
const port = 8080;
app.listen(port, () => {
	console.log(`server started at http://localhost:${port}`);
});
