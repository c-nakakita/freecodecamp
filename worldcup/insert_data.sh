#! /bin/bash

if [[ $1 == "test" ]]
then
  PSQL="psql --username=postgres --dbname=worldcuptest -t --no-align -c"
else
  PSQL="psql --username=freecodecamp --dbname=worldcup -t --no-align -c"
fi

# Do not change code above this line. Use the PSQL variable above to query your database.

echo $($PSQL "TRUNCATE teams, games")

cat games.csv | while IFS="," read YEAR ROUND WINNER OPPONENT WINNER_GOALS OPPONENT_GOALS
do
  if [[ $YEAR != "year" ]]
  then
    # get winner team id
    W_TEAM_ID=$($PSQL "select team_id from teams where name = '$WINNER'")
    # if not found
    if [[ -z $W_TEAM_ID ]]
    then
      # insert team
      INSERT_W_TEAM_RESULT=$($PSQL "INSERT INTO teams(name) VALUES('$WINNER')")
      if [[ $INSERT_W_TEAM_RESULT == "INSERT 0 1" ]]
      then
        W_TEAM_ID=$($PSQL "select team_id from teams where name = '$WINNER'")
      fi
    fi

    # get opponent team id
    O_TEAM_ID=$($PSQL "select team_id from teams where name = '$OPPONENT'")
    # if not found
    if [[ -z $O_TEAM_ID ]]
    then
      # insert team
      INSERT_O_TEAM_RESULT=$($PSQL "INSERT INTO teams(name) VALUES('$OPPONENT')")
      if [[ $INSERT_O_TEAM_RESULT == "INSERT 0 1" ]]
      then
        O_TEAM_ID=$($PSQL "select team_id from teams where name = '$OPPONENT'")
      fi
    fi
    # insert into games
    INSERT_GAME_RESULT=$($PSQL "INSERT INTO games(year, round, winner_id, opponent_id, winner_goals, opponent_goals) VALUES($YEAR, '$ROUND', $W_TEAM_ID, $O_TEAM_ID, $WINNER_GOALS, $OPPONENT_GOALS)")
  fi
done