import z from 'zod'

export const registerValidator = z
  .object({
    username: z
      .string({
        required_error: 'username is required',
      })
      .min(3, 'username minimum 3 characters'),
    password: z
      .string({
        required_error: 'password is required',
      })
      .min(8, 'password minimum 8 characters'),
    passwordConfirmation: z.string({
      required_error: 'password confirmation is required',
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "password confirmation doesn't match",
    path: ['passwordConfirmation'],
  })

export const loginValidator = z.object({
  username: z.string({
    required_error: 'username is required',
  }),
  password: z.string({
    required_error: 'password is required',
  }),
})
