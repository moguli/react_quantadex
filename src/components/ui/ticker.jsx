import React, { Component } from 'react';

export const Token = ({ name }) => {
	if (name === undefined || name === null) {
		return "INVALID"
	}

	const token = name.split("*")
	return <span>{token[0]}<b>{token[1].substr(0, 4)}</b></span>
}

export default ({ticker}) => {
	if (ticker === undefined || ticker === null) {
		return "INVALID"
	}

	const comp = ticker.split("/")
	const base = comp[0].split("*")
	const counter = comp[1].split("*")

	return <span>{base[0]}<b>{base[1].substr(0, 4)}</b>/{counter[0]}<b>{counter[1].substr(0, 4)}</b></span>
}