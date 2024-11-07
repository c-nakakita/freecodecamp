#!/bin/bash

PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"

MAIN() {
  echo "Enter your username:"
  read USER_NAME
  if [[ -z $USER_NAME ]]
  then
    MAIN
  elif [[ ${#USER_NAME} -gt 22 ]]
  then
    MAIN
  else
    USER_ID=$($PSQL "select user_id from users where name='$USER_NAME'")
    if [[ -z $USER_ID ]]
    then
      INSERT_USER_RSLT=$($PSQL "insert into users(name) values('$USER_NAME')")
      USER_ID=$($PSQL "select user_id from users where name='$USER_NAME'")
      echo "Welcome, $USER_NAME! It looks like this is your first time here."
    else
      VALUE_STR=$($PSQL "select count(game_id), min(number_of_guesses) from games where user_id=$USER_ID group by user_id")
      IFS='|' read -r GAMES_PLAYED BEST_GAME <<< "$VALUE_STR"
      echo "Welcome back, $USER_NAME! You have played $GAMES_PLAYED games, and your best game took $BEST_GAME guesses."
    fi
    SECRET_NUMBER=$(( RANDOM % 1001 ))
    NUMBER_OF_GUESSES=0
    echo "Guess the secret number between 1 and 1000:"
    while :; do
      read NUMBER_INPUT
      if [[ "$NUMBER_INPUT" =~ ^[0-9]+$ ]] && (( $NUMBER_INPUT >= 0 && $NUMBER_INPUT <= 1000 ))
      then
        ((NUMBER_OF_GUESSES++))
        if (( $SECRET_NUMBER < $NUMBER_INPUT ))
        then
          echo "It's lower than that, guess again:"
        elif (( $SECRET_NUMBER > $NUMBER_INPUT ))
        then
          echo "It's higher than that, guess again:"
        else
          INSERT_GAME_RSLT=$($PSQL "insert into games(user_id, number_of_guesses) values($USER_ID, $NUMBER_OF_GUESSES)")
          echo "You guessed it in $NUMBER_OF_GUESSES tries. The secret number was $SECRET_NUMBER. Nice job!"
          break
        fi
      else
        echo "That is not an integer, guess again:"
      fi
    done
  fi
}

MAIN