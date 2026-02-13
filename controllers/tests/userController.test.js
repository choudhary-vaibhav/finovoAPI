const userController = require('../userController');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const userServices = require('../../services/userServices');

jest.mock("bcrypt", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('../../services/userServices', () => ({
    createUser: jest.fn(),
    getUser: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
}));

describe('signup', () => {
    let req, res;

    beforeEach(() =>{
        req = {
            body: { }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if name is not provided', async () => {
        req.body = {
            email: 'abc@xyz.com',
            password: 'password123'
        }

        await userController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Name not provided" });
    });

    test('should return 400 if email is not provided', async () => {
        req.body = {
            name: 'test123',
            password: 'password123'
        }

        await userController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email not provided" });
    });

    test('should return 400 if password is not provided', async () => {
        req.body = {
            name: 'test123',
            email: 'abc@xyz.com'
        }

        await userController.signup(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Password not provided" });
    });

    test('should hash password and call createUser service', async () => {
        req.body = {
            name: 'test123',
            email: 'abc@xyz.com',
            password: 'password123'
        }

        // mock bcrypt.genSalt
        bcrypt.genSalt.mockImplementation((rounds, cb) => {
            cb(null, "fakeSalt");
        });

        // mock bcrypt.hash
        bcrypt.hash.mockImplementation((password, salt, cb) => {
            cb(null, "hashedPassword");
        });

        userServices.createUser.mockResolvedValue(true);

        await userController.signup(req, res);

        expect(bcrypt.genSalt).toHaveBeenCalledWith(10, expect.any(Function));
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'fakeSalt', expect.any(Function));
        expect(userServices.createUser).toHaveBeenCalledWith('test123', 'abc@xyz.com', 'hashedPassword', res);

    });
});

describe('signin', () => {
    let req, res;

    beforeEach(() =>{
        req = {
            body: { }
        };

        process.env.JWT_SECRET = "testsecret";

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return 400 if email is not provided', async () => {
        req.body = {
            password: 'password123'
        }

        await userController.signin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Email not provided" });
    });

    test('should return 400 if password is not provided', async () => {
        req.body = {
            email: 'abc@xyz.com'
        }

        await userController.signin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Password not provided" });
    });

    test("should return 404 if user not found", async () => {
        req.body = {
            email: "nouser@test.com",
            password: "123456"
        };

        userServices.getUser.mockResolvedValue(null);

        await userController.signin(req, res);

        expect(userServices.getUser).toHaveBeenCalledWith("nouser@test.com");
    });

    test('should return 404 if the password does not match', async() => {
        req.body = {
            email: 'abc@xyz.com',
            password: 'password123'
        }

        userServices.getUser.mockResolvedValue({
            _id: '1234567',
            email: 'abc@xyz.com',
            name: 'test123',
            password: 'hashedpassword'
        })

        bcrypt.compare.mockImplementation((pass, hash, cb) => {
            cb(null, false)
        })

        await userController.signin(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid Password! "
        });
    });

    test("should return 200 and token if login successful", async () => {
        req.body = {
            email: "john@test.com",
            password: "123456"
        };

        const mockUser = {
            _id: "123",
            id: "123",
            name: "John",
            email: "john@test.com",
            password: "hashedPassword"
        };

        userServices.getUser.mockResolvedValue(mockUser);

        bcrypt.compare.mockImplementation((pass, hash, cb) => {
            cb(null, true);
        });

        jwt.sign.mockReturnValue("fakeToken");

        await userController.signin(req, res);

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: mockUser._id },
            "testsecret",
            { expiresIn: "60000" }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
        user: {
            id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email
        },
        message: "Login Successful",
        accessToken: "fakeToken"
        });
    });
});