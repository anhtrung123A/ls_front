import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  CssBaseline,
  FormControl,
  FormControlLabel,
  Link,
  NativeSelect,
  Paper,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { checkEmail, login } from '../../services/authApi'
import { authTypography } from '../../constants/authTypography'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const theme = createTheme({
  palette: {
    primary: { main: '#0842a0' },
    background: { default: '#f0f4f9' },
    text: {
      primary: '#1f1f1f',
      secondary: '#5f6368',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
})

export function EmailStepPage() {
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [direction, setDirection] = useState<1 | -1>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState('en-us')

  const canSubmit = useMemo(() => {
    if (isLoading) {
      return false
    }
    return step === 'email' ? email.trim().length > 0 : password.trim().length > 0
  }, [email, isLoading, password, step])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (step === 'email') {
      const normalizedEmail = email.trim().toLowerCase()
      if (!isValidEmail(normalizedEmail)) {
        setError('Enter a valid email address.')
        setStatusMessage('')
        return
      }

      setIsLoading(true)
      setError('')
      setStatusMessage('')
      try {
        const response = await checkEmail(normalizedEmail)
        if (!response.exists) {
          setError("Couldn't find your account with this email.")
          return
        }
        setEmail(response.email)
        setDirection(1)
        setStep('password')
      } catch (requestError) {
        const message =
          requestError instanceof Error ? requestError.message : 'Cannot connect to the server.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    setError('')
    setStatusMessage('')
    try {
      await login(email.trim().toLowerCase(), password)
      setStatusMessage('Signed in successfully.')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Login failed.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleBackToEmailStep() {
    setDirection(-1)
    setStep('email')
    setPassword('')
    setShowPassword(false)
    setError('')
    setStatusMessage('')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
        }}
      >
        <Box sx={{ width: 'min(1040px, 100%)' }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '28px',
              p: { xs: 4, md: 6 },
              boxShadow: '0 1px 2px rgba(60,64,67,0.1),0 1px 3px rgba(60,64,67,0.08)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: direction === 1 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? -20 : 20 }}
                transition={{ duration: 0.2 }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
                    gap: 8,
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      G
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: authTypography.title.fontSize,
                        fontWeight: authTypography.title.fontWeight,
                        color: authTypography.title.color,
                        mb: 2,
                      }}
                    >
                      {step === 'email' ? 'Sign in' : 'Welcome'}
                    </Typography>
                    {step === 'email' ? (
                      <Typography
                        sx={{
                          fontSize: authTypography.subtitle.fontSize,
                          fontWeight: authTypography.subtitle.fontWeight,
                          color: authTypography.subtitle.color,
                        }}
                      >
                        Use your account
                      </Typography>
                    ) : (
                      <Paper
                        component="button"
                        type="button"
                        variant="outlined"
                        onClick={handleBackToEmailStep}
                        sx={{
                          mt: 1,
                          px: 1.2,
                          py: 0.5,
                          borderRadius: 4,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          borderColor: '#747775',
                          backgroundColor: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <Box sx={{ display: 'inline-flex', color: '#5f6368' }}>
                          <svg className="avatar" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z" />
                          </svg>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: authTypography.chipEmail.fontSize,
                            fontWeight: authTypography.chipEmail.fontWeight,
                            color: authTypography.chipEmail.color,
                          }}
                        >
                          {email}
                        </Typography>
                      </Paper>
                    )}
                  </Box>

                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ minHeight: 320, display: 'flex', flexDirection: 'column' }}
                  >
                    {step === 'email' ? (
                      <>
                        <TextField
                          label="Email or phone"
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value)
                            setError('')
                            setStatusMessage('')
                          }}
                          error={Boolean(error)}
                          sx={{
                            '& .MuiInputBase-input': {
                              fontSize: authTypography.inputText.fontSize,
                              fontWeight: authTypography.inputText.fontWeight,
                              color: authTypography.inputText.color,
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: authTypography.floatingLabel.fontSize,
                              fontWeight: authTypography.floatingLabel.fontWeight,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: authTypography.floatingLabel.colorFocus,
                            },
                          }}
                          fullWidth
                        />
                        <Button
                          variant="text"
                          sx={{
                            alignSelf: 'flex-start',
                            mb: 4,
                            mt: 1,
                            textTransform: 'none',
                            borderRadius: 5,
                            fontSize: authTypography.link.fontSize,
                            fontWeight: authTypography.link.fontWeight,
                            color: authTypography.link.color,
                          }}
                        >
                          Forgot email?
                        </Button>

                        <Typography
                          sx={{
                            fontSize: authTypography.helperText.fontSize,
                            fontWeight: authTypography.helperText.fontWeight,
                            color: authTypography.helperText.color,
                          }}
                        >
                          Not your computer? Use Guest mode to sign in privately.{' '}
                          <Link
                            href="#"
                            underline="none"
                            sx={{
                              fontSize: authTypography.link.fontSize,
                              fontWeight: authTypography.link.fontWeight,
                              color: authTypography.link.color,
                            }}
                          >
                            Learn more about using Guest mode
                          </Link>
                        </Typography>
                      </>
                    ) : (
                      <>
                        <TextField
                          label="Enter your password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value)
                            setError('')
                            setStatusMessage('')
                          }}
                          error={Boolean(error)}
                          sx={{
                            mt: 4,
                            '& .MuiInputBase-input': {
                              fontSize: authTypography.inputText.fontSize,
                              fontWeight: authTypography.inputText.fontWeight,
                              color: authTypography.inputText.color,
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: authTypography.floatingLabel.fontSize,
                              fontWeight: authTypography.floatingLabel.fontWeight,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: authTypography.floatingLabel.colorFocus,
                            },
                          }}
                          autoFocus
                          fullWidth
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showPassword}
                              onChange={(event) => setShowPassword(event.target.checked)}
                            />
                          }
                          label="Show password"
                          sx={{ mb: 4, mt: 1 }}
                        />
                      </>
                    )}

                    {statusMessage ? (
                      <Typography variant="body2" sx={{ mt: 2, color: '#188038' }}>
                        {statusMessage}
                      </Typography>
                    ) : null}

                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {step === 'email' ? (
                        <Button
                          variant="text"
                          sx={{
                            textTransform: 'none',
                            borderRadius: 5,
                            fontSize: authTypography.link.fontSize,
                            fontWeight: authTypography.link.fontWeight,
                            color: authTypography.link.color,
                          }}
                        >
                          Create account
                        </Button>
                      ) : (
                        <Button
                          variant="text"
                          sx={{
                            textTransform: 'none',
                            borderRadius: 5,
                            fontSize: authTypography.link.fontSize,
                            fontWeight: authTypography.link.fontWeight,
                            color: authTypography.link.color,
                          }}
                          onClick={handleBackToEmailStep}
                        >
                          Try another way
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        disableElevation
                        disabled={!canSubmit}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 5,
                          px: 3,
                          fontSize: authTypography.primaryButton.fontSize,
                          fontWeight: authTypography.primaryButton.fontWeight,
                          color: authTypography.primaryButton.color,
                        }}
                      >
                        {isLoading ? (step === 'email' ? 'Checking...' : 'Signing in...') : 'Next'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Card>

          <Box
            sx={{
              mt: 3,
              px: 1,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <FormControl
              variant="standard"
              sx={{
                minWidth: 210,
                '& .MuiInputBase-root::before, & .MuiInputBase-root::after': { display: 'none' },
                '& .MuiNativeSelect-select': {
                  fontSize: 12,
                  fontWeight: authTypography.footer.fontWeight,
                  color: authTypography.footer.color,
                  px: 1,
                  py: 0.75,
                  borderRadius: 1,
                },
                '& .MuiNativeSelect-select:hover': {
                  backgroundColor: 'rgba(68, 71, 70, 0.08)',
                },
              }}
            >
              <NativeSelect
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                inputProps={{ 'aria-label': 'Language selector' }}
              >
                <option value="en-us">English (United States)</option>
                <option value="vi-vn">Tiếng Việt</option>
              </NativeSelect>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link
                href="#"
                underline="none"
                sx={{
                  fontSize: authTypography.footer.fontSize,
                  fontWeight: authTypography.footer.fontWeight,
                  color: authTypography.footer.color,
                }}
              >
                Help
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  fontSize: authTypography.footer.fontSize,
                  fontWeight: authTypography.footer.fontWeight,
                  color: authTypography.footer.color,
                }}
              >
                Privacy
              </Link>
              <Link
                href="#"
                underline="none"
                sx={{
                  fontSize: authTypography.footer.fontSize,
                  fontWeight: authTypography.footer.fontWeight,
                  color: authTypography.footer.color,
                }}
              >
                Terms
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
