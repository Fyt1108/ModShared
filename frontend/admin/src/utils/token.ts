export const getToken = (): string | null => {
    const token = localStorage.getItem('authorization')
    return token
}

export const getRefreshToken = (): string | null => {
    const token = localStorage.getItem('refreshtoken')
    return token
}

export const setToken = (token: string) => {
    localStorage.setItem('authorization', token)
}

export const setRefreshToken = (token: string) => {
    localStorage.setItem('refreshtoken', token)
}

export const removeToken = () => {
    localStorage.removeItem('authorization')
    localStorage.removeItem('refreshtoken')
}