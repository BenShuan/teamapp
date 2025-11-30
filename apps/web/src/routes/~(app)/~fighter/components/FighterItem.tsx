import { Badge } from "@/web/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/web/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Fighter } from "@teamapp/api/schema";
import React from "react";

type Props = {
  fighter: Fighter;
};

const FighterItem: React.FC<Props> = ({ fighter }) => {
  const fName = fighter.firstName+" "+fighter.lastName
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="truncate" title={fName}>
          <Link to={"/fighter/"+fighter.id} >
          {fName || "אין שם"}
          </Link>
        </CardTitle>
        {fighter.class ? <Badge variant="secondary">כיתה {fighter.class}</Badge> : null}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          {fighter.personalNumber && (
            <div>
              <span className="text-muted-foreground">מספר אישי #:</span> {fighter.personalNumber}
            </div>
          )}
          {fighter.idNumber && (
            <div>
              <span className="text-muted-foreground">ת.ז:</span> {fighter.idNumber}
            </div>
          )}
          {fighter.teamId != null && (
            <div>
              <span className="text-muted-foreground">צוות:</span> {fighter.teamId}
            </div>
          )}
          {fighter.ironNumber != null && (
            <div>
              <span className="text-muted-foreground">מספר ברזל #:</span> {fighter.ironNumber}
            </div>
          )}
          {fighter.phoneNumber && (
            <div>
              <span className="text-muted-foreground">טלפון:</span> {fighter.phoneNumber}
            </div>
          )}
          {fighter.email && (
            <div className="truncate" title={fighter.email}>
              <span className="text-muted-foreground">אימייל:</span> {fighter.email}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {fighter.kit && <Badge>{fighter.kit}</Badge>}
          {fighter.professional && <Badge variant="outline">{fighter.professional}</Badge>}
          {fighter.shirtSize && <Badge variant="secondary">חולצה {fighter.shirtSize}</Badge>}
          {fighter.pantsSize && <Badge variant="secondary">מכנסיים {fighter.pantsSize}</Badge>}
          {fighter.shoesSize != null && <Badge variant="secondary">נעליים {fighter.shoesSize}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
};

export default FighterItem;
